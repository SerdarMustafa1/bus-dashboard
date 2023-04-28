import React from 'react';

import { translate } from 'react-i18next';

import FormControl from 'react-bootstrap/FormControl';

export default translate()(({ i18n }) => {
  return (
    <FormControl
      defaultValue={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      as="select"
    >
      {i18n.validLangs.map(({ short }) => (
        <option key={short} value={short}>
          {short.toUpperCase()}
        </option>
      ))}
    </FormControl>
  );
});
