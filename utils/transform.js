export function transformObjectToArray(obj) {
  return Object.entries(obj).map(([template_id, template_info]) => ({
      template_id,
      template_info: JSON.stringify(template_info)
  }));
}
