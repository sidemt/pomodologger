export function parseBool(str, defaultValue = false) {
  switch (str.toLowerCase()) {
    case 'true':
      return true;
      break;
    case 'false':
      return false;
      break;
    default:
      return defaultValue;
  }
}
