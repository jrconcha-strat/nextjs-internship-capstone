export const today = new Date().setHours(0,0,0,0); // reset to 00:00:00

export const errorTemplates = {
  idMinError : {error: "ID cannot be less than one."},
  positionMinError : {error: "Position cannot be less than zero."},
  nameMinError: { error: "Name cannot be empty." },
  nameMaxError: { error: "Name has exceeded maximum character length (100)." },
  nameFormatError: { error: "Name format invalid." },
  emailFormatError: { error: "Email format invalid." },
  descriptionMaxError: { error: "Description has exceeded maximum character length (200)." },
  dueDateMinError : {error: "Cannot set a due date for the past."},
  titleMaxError : {error: "Title has exceeded maximum character length (50)."},
  titleMinError : {error: "Title cannot be empty."},
  contentMinError: {error: "Comment must have at least 15 characters."},
  teamNameMinError: {error: "Team name cannot be empty."},
  teamNameMaxError: {error: "Team name has exceed maximum character length (50)."}
};