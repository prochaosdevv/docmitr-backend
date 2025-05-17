export function capitalize(string) {
  const splitString = string?.split(" ");
  return (
    splitString[0][0]?.toUpperCase() +
    splitString[0]?.slice(1)?.toLowerCase() +
    " " +
    splitString[1][0]?.toUpperCase() +
    splitString[1]?.slice(1)?.toLowerCase()
  );
}
