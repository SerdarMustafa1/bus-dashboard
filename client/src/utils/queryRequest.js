export default async (query, signal, key) => {
  let token = key || sessionStorage.getItem('_t') || localStorage.getItem('_t');
  const res = await fetch('/api', {
    method: 'POST',
    signal: signal,
    body: JSON.stringify({ query: query }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
};

// const query = { query: `query{ clients { _id }}`}

// try {
//    const {clients} = await queryRequest(query);
//    if (clients) { }
// } catch (err) {
//   if (err.name === 'SyntaxError') {
//     // No Connection
//   } else if (err.name === 'AbortError') {
//     // Aborted
//   } else {
//     // Bad request
//   }
// }
