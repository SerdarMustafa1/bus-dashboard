import React from 'react';

export default React.createContext({
  token: null,
  tokenExpiration: null,
  _id: null,
  name: null,
  role: null,
  login: () => {},
  logout: () => {},
});
