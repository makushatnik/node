export default function canonize(url) {
  const re = new RegExp('@?(https?:)?(\/\/)?([a-zA-Z0-9_.-]{2,}/)?@?([a-zA-Z0-9_.]+)', 'i');
  return url.match(re)[4];
}
