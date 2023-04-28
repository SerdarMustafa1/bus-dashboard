import React, { useContext } from 'react';
import GeneralAdmin from '../roleBased/generalAdmin';
import GeneralLead from '../roleBased/generalLead';

import AuthContext from "../../../context/auth-context";

export default () => {
    const context = useContext(AuthContext);
    return context.role === 1 ? <GeneralLead/> : <GeneralAdmin/>
};
