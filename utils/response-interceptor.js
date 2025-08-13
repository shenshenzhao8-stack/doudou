export default function responseInterceptor(res) {
  if (res.code == 200) {
    return res;
  } else {
    console.error(res);

    throw res;
  }
}
