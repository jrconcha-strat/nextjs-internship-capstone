import { queries } from "@/lib/db/queries/queries";

// Dummy Data for Creation. Assumes A User with id 1 exists
const dummyDataCreation = {
  projects: {
    name: "Website Redesign",
    description: "Redesign the company website with modern UI",
    status: "Planning" as const,
    ownerId: 1,
    dueDate: new Date("2025-09-30T00:00:00Z"),
    created_at: new Date("2025-08-01T08:00:00Z"),
    updated_at: new Date("2025-08-01T08:00:00Z"),
    archivedAt: null,
  },
  lists: {
    name: "To Do",
    projectId: 1,
    position: 1,
    created_at: new Date("2025-08-01T08:05:00Z"),
    updated_at: new Date("2025-08-01T08:05:00Z"),
    archivedAt: null,
  },
  tasks: {
    title: "Wireframe the homepage",
    description: "Create wireframes for the homepage redesign.",
    listId: 1,
    priority: "medium" as const,
    labels: ["UI", "Design"],
    dueDate: new Date("2025-08-10T00:00:00Z"),
    position: 1,
    created_at: new Date("2025-08-01T08:10:00Z"),
    updated_at: new Date("2025-08-01T08:10:00Z"),
    archivedAt: null,
  },
  comments: {
    content: "Don't forget to align with the branding guidelines.",
    taskId: 1,
    authorId: 1,
    created_at: new Date("2025-08-01T08:15:00Z"),
    updated_at: new Date("2025-08-01T08:15:00Z"),
    archivedAt: null,
  },
};

// Dummy Data for updating, Assumes Dummy Data Creation has been created.
const dummyDataUpdating = {
  projects: {
    id: 1,
    name: "Mobile App Launch",
    description: "Build and deploy the initial version of the mobile app.",
    status: "Planning" as const,
    ownerId: 1,
    dueDate: new Date("2025-10-15T00:00:00Z"),
    created_at: new Date("2025-08-01T08:20:00Z"),
    updated_at: new Date("2025-08-01T08:20:00Z"),
    archivedAt: null,
  },
  lists: {
    id: 1,
    name: "Sprint Backlog",
    projectId: 1,
    position: 1,
    created_at: new Date("2025-08-01T08:25:00Z"),
    updated_at: new Date("2025-08-01T08:25:00Z"),
    archivedAt: null,
  },
  tasks: {
    id: 1,
    title: "Implement user login",
    description: "Develop authentication feature using OAuth.",
    listId: 1,
    priority: "high" as const,
    labels: ["Auth", "Backend"],
    dueDate: new Date("2025-08-15T00:00:00Z"),
    position: 1,
    created_at: new Date("2025-08-01T08:30:00Z"),
    updated_at: new Date("2025-08-01T08:30:00Z"),
    archivedAt: null,
  },
  comments: {
    id: 1,
    content: "Make sure to handle token refresh logic.",
    taskId: 1,
    authorId: 1,
    created_at: new Date("2025-08-01T08:35:00Z"),
    updated_at: new Date("2025-08-01T08:35:00Z"),
    archivedAt: null,
  },
};

async function testUsersQueries() {
  const userGetAllResult = await queries.users.getAll();
  const userGetByIdResult = await queries.users.getById(1);

  console.log(
    `Get all users Result: ${JSON.stringify(userGetAllResult)}`,
  );
  console.log(
    `Get by user id Result: ${JSON.stringify(userGetByIdResult)}`,
  );
}

// Test Queries Functions
async function testProjectsQueries() {
  // const projectsCreationResult = await queries.projects.create(
  //   dummyDataCreation["projects"],
  // );
  // console.log(
  //   `projectsCreation Result: ${JSON.stringify(projectsCreationResult)}`,
  // );
  // const projectsGetAllResult = await queries.projects.getAll();
  // const projectsGetByIdResult = await queries.projects.getById(8);
  // console.log(
  //   `Get all projects Result: ${JSON.stringify(projectsGetAllResult)}`,
  // );
  // console.log(
  //   `Get by project id Result: ${JSON.stringify(projectsGetByIdResult)}`,
  // );
  const projectsUpdatingResult = await queries.projects.update(
    9,
    dummyDataUpdating["projects"],
  );
  // const projectsDeletionResult = await queries.projects.delete(1);
  console.log(
    `projectsUpdatingResult: ${JSON.stringify(projectsUpdatingResult)}`,
  );
  // console.log(
  //   `projectsDeletionResult: ${JSON.stringify(projectsDeletionResult)}`,
  // );
}

async function testListsQueries() {
  const listsCreationResult = await queries.lists.create(
    dummyDataCreation["lists"],
  );
  console.log(
    `listCreation Result: ${JSON.stringify(listsCreationResult, null, 2)}`,
  );
  const listsGetByProject = await queries.lists.getByProject(1);
  const listsGetByIdResult = await queries.lists.getById(1);
  console.log(
    `Get all lists Result: ${JSON.stringify(listsGetByProject, null, 2)}`,
  );
  console.log(
    `Get by list id Result: ${JSON.stringify(listsGetByIdResult, null, 2)}`,
  );
  const listsUpdatingResult = await queries.lists.update(
    1,
    dummyDataUpdating["lists"],
  );
  const listsDeletionResult = await queries.lists.delete(1);
  console.log(
    `listsUpdatingResult: ${JSON.stringify(listsUpdatingResult, null, 2)}`,
  );
  console.log(
    `listsDeletionResult: ${JSON.stringify(listsDeletionResult, null, 2)}`,
  );
}

async function testTasksQueries() {
  const tasksCreationResult = await queries.tasks.create(
    dummyDataCreation["tasks"],
  );
  console.log(
    `tasksCreation Result: ${JSON.stringify(tasksCreationResult, null, 2)}`,
  );
  const tasksGetByList = await queries.tasks.getByList(1);
  const tasksGetByIdResult = await queries.tasks.getById(1);
  console.log(
    `Get all tasks Result: ${JSON.stringify(tasksGetByList, null, 2)}`,
  );
  console.log(
    `Get by task id Result: ${JSON.stringify(tasksGetByIdResult, null, 2)}`,
  );
  const tasksUpdatingResult = await queries.tasks.update(
    1,
    dummyDataUpdating["tasks"],
  );
  const tasksDeletionResult = await queries.tasks.delete(1);
  console.log(
    `tasksUpdatingResult: ${JSON.stringify(tasksUpdatingResult, null, 2)}`,
  );
  console.log(
    `tasksDeletionResult: ${JSON.stringify(tasksDeletionResult, null, 2)}`,
  );
}

async function testCommentsQueries() {
  const commentsCreationResult = await queries.comments.create(
    dummyDataCreation["comments"],
  );
  console.log(
    `commentsCreation Result: ${JSON.stringify(commentsCreationResult, null, 2)}`,
  );
  const commentsGetByComment = await queries.comments.getByTask(1);
  const commentsGetByIdResult = await queries.comments.getById(1);
  console.log(
    `Get all comments Result: ${JSON.stringify(commentsGetByComment, null, 2)}`,
  );
  console.log(
    `Get by comment id Result: ${JSON.stringify(commentsGetByIdResult, null, 2)}`,
  );
  const commentsUpdatingResult = await queries.comments.update(
    1,
    dummyDataUpdating["comments"],
  );
  const commentsDeletionResult = await queries.comments.delete(1);
  console.log(
    `commentsUpdatingResult: ${JSON.stringify(commentsUpdatingResult, null, 2)}`,
  );
  console.log(
    `commentsDeletionResult: ${JSON.stringify(commentsDeletionResult, null, 2)}`,
  );
}

// FOR TESTING //
async function main() {
//   testUsersQueries();

  testProjectsQueries();

//   testListsQueries();

//   testTasksQueries();

//   testCommentsQueries();
}

main();
