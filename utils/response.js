const cb = (callback) => (
  {
    statusCode: callback.code,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(callback),
  }
);

export default { cb };
