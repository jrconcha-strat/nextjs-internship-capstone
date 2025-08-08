import { db } from "../db-index";
import * as schema from "../schema";
import { eq } from "drizzle-orm";
import * as types from "../../../types/index";
import { queries } from "./queries";

type QueryKeys = Exclude<keyof typeof queries, "teams">;

// Used to map the query key to their tables
const tableMap = {
  users: schema.users,
  projects: schema.projects,
  lists: schema.lists,
  tasks: schema.tasks,
  comments: schema.comments,
} as const;

type QueryKeysWithParents = keyof typeof childToParentTableMetadata;

// Used to map the query keys, with known parents, to their parent tables and exposing the child's foreign key.
const childToParentTableMetadata = {
  lists: {
    parent_table: "projects",
    child_foreign_key: schema.lists.projectId,
  },
  tasks: { parent_table: "lists", child_foreign_key: schema.tasks.listId },
  comments: {
    parent_table: "tasks",
    child_foreign_key: schema.comments.taskId,
  },
} as const;

// Generic utility functions.

export const getByParentObject = async <T>(
  parentId: number,
  query_key: QueryKeysWithParents,
): Promise<types.QueryResponse<Array<T>>> => {
  try {
    // The table of the child object. e.g task.
    const childTable = tableMap[query_key];
    // Here we get the necessary information linking the child to its parent table, e.g info that links task to list.
    const { child_foreign_key, parent_table } = childToParentTableMetadata[query_key];
    const childObjects = await db.select().from(childTable).where(eq(child_foreign_key, parentId));

    // Check if child objects exist.
    if (childObjects.length > 1) {
      return {
        success: true,
        message: `All ${query_key} retrieved using parent ${parent_table} id: ${parentId}.`,
        data: childObjects as Array<T>,
      };
    }
    // No child objects for this parent object in the database.
    else if (childObjects.length === 0) {
      return {
        success: true,
        message: `There are currently no ${query_key} for this parent ${parent_table}.`,
        data: childObjects as Array<T>,
      };
    }
    throw new Error(`No ${query_key} for this parent ${parent_table} retrieved.`);
  } catch (e) {
    return {
      success: false,
      message: `Unable to retrieve ${query_key} using parent id: ${parentId}.`,
      error: e,
    };
  }
};

export const createObject = async <T>(
  data: types.ObjectInsert,
  query_key: QueryKeys,
): Promise<types.QueryResponse<T>> => {
  try {
    const table = tableMap[query_key];
    const newObject = data;
    const result = await db.insert(table).values(newObject);
    // Check if operation is successful
    if (result.rowCount === 1) {
      return {
        success: true,
        message: `New ${query_key} object successfully created.`,
        data: newObject as T,
      };
    }
    throw new Error(`Error: response.rowCount returned 0 rows modified. Check database connection.`);
  } catch (e) {
    return {
      success: false,
      message: `Unable to create the ${query_key} object.`,
      error: e,
    };
  }
};

export const getAllObject = async <T>(query_key: QueryKeys): Promise<types.QueryResponse<Array<T>>> => {
  try {
    const table = tableMap[query_key];

    const objects = await db.select().from(table);
    // Check if objects exist
    if (objects.length >= 1) {
      return {
        success: true,
        message: `All ${query_key} retrieved.`,
        data: objects as Array<T>,
      };
    }
    // No objects in database.
    else if (objects.length === 0) {
      return {
        success: true,
        message: `There are currently no ${query_key}.`,
        data: objects as Array<T>,
      };
    }
    throw new Error(`No ${query_key} retrieved.`);
  } catch (e) {
    return {
      success: false,
      message: `Unable to retrieve all ${query_key}.`,
      error: e,
    };
  }
};

export const getObjectById = async <T>(id: number, query_key: QueryKeys): Promise<types.QueryResponse<T>> => {
  try {
    const table = tableMap[query_key];
    const [object] = await db.select().from(table).limit(1).where(eq(table.id, id));
    // Check if object exists.
    if (object) {
      return {
        success: true,
        message: `${query_key} retrieved using id: ${id}.`,
        data: object as T,
      };
    }
    throw new Error(`${query_key} does not exist.`);
  } catch (e) {
    return {
      success: false,
      message: `Unable to retrieve ${query_key} using id: ${id}.`,
      error: e,
    };
  }
};

export const deleteObject = async <T>(id: number, query_key: QueryKeys): Promise<types.QueryResponse<T>> => {
  try {
    // Check if object exists
    const table = tableMap[query_key];
    const response = await queries[query_key].getById(id);

    if (response.success === false) {
      // Failed to retrieve, throw error.
      throw new Error(response.message);
    }

    // Retrieve the data of the object to be deleted
    const existingObjectData = response.data as T;

    const result = await db.delete(table).where(eq(table.id, id));

    // Check if deletion is successful.
    if (result.rowCount === 1) {
      return {
        success: true,
        message: `Deleted object of type ${query_key} successfully.`,
        data: existingObjectData,
      };
    } else {
      return {
        success: false,
        message: `Unable to delete object of type ${query_key}`,
        error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
      };
    }
  } catch (e) {
    return {
      success: false,
      message: `Unable to Archive object of type ${query_key}.`,
      error: e,
    };
  }
};

export const updateObject = async <TSelect, TInsert>(
  id: number,
  data: TInsert,
  query_key: QueryKeys,
  getById: (id: number) => Promise<types.QueryResponse<TSelect>>,
  compare: (existing: TSelect, incoming: TInsert) => Partial<TInsert>,
  getBaseFields: (existing: TSelect) => TInsert, // This argument function simply removes the id from TSelect
): Promise<types.QueryResponse<TInsert>> => {
  try {
    const table = tableMap[query_key];
    const updatedObjectData = data as TInsert;

    // Retrieve existing object data. Check if object exists.
    const response = await getById(id);
    if (response.success === false) {
      // Failed to retrieve, throw error.
      throw new Error(response.message);
    }

    // Determine which fields have changed.
    const existingObjectData = response.data;

    const changed = compare(existingObjectData, updatedObjectData);

    const finalUpdatedObjectData = {
      ...getBaseFields(existingObjectData),
      ...changed,
      ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
    };

    if (Object.keys(changed).length === 0) {
      return {
        success: true,
        message: `No changes detected for object of type ${query_key}.`,
        data: getBaseFields(existingObjectData),
      };
    }

    const result = await db.update(table).set(finalUpdatedObjectData).where(eq(table.id, id));

    // Check if update is successful.
    if (result.rowCount === 1) {
      return {
        success: true,
        message: `Updated object of type ${query_key} successfully.`,
        data: finalUpdatedObjectData,
      };
    } else {
      return {
        success: false,
        message: `Unable to update object of type ${query_key}.`,
        error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
      };
    }
  } catch (e) {
    return {
      success: false,
      message: `Unable to update the object of type ${query_key}.`,
      error: e,
    };
  }
};

export const getBaseFields = (existingData: types.ObjectSelect) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...base } = existingData;
  return base;
};
