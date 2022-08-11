export const isEditor = (project, userId) => {
  for (const editor of project.editors) {
    if (editor.id === userId) return true
  }
  return false
}
export const getFormattedDate = (value) => {
  const date = new Date(value)
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }
  return date.toLocaleDateString("de", options)
}
