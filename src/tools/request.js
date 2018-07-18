function rpcAjax(url, method, params) {
  return fetch(url, {
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params: [params],
      id: 1
    }),
    cache: 'no-cache',
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    referrer: 'no-referrer'
  })
    .then(response => response.json())
    .then(data => (data ? data.result : null))
    .catch(error => error)
}

function serverAjax(url, body) {
  return fetch(url, {
    body: JSON.stringify(body),
    cache: 'no-cache',
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    referrer: 'no-referrer'
  })
    .then(response => response.json())
    .then(data => data)
    .catch(error => error)
}

export { rpcAjax, serverAjax }
