import React from "react";
import { RoleLink } from '../routes';

import Spinner from 'react-bootstrap/Spinner';

const SmallInfoCard = (props) => {
    const { link, id, colorDescription, loaded, title, main, description } = props.item;
    const color = props.item.color || 'orange';

    return (
            <div className="mini-stat bg-white text-center">
                {title}
                {!loaded &&
                <div className="text-center m-3">
                    <Spinner variant="warning" animation='border'/>
                </div>}

                {loaded &&
                <React.Fragment>
                    <div className="mini-stat-info">
                        {link && <RoleLink to={link} id={id}><span className={"counter text-" + color}>{main}</span></RoleLink>}
                        {!link && <span className={"counter text-" + color}>{main}</span>}
                    </div>
                    <p className={"mb-0 m-t-20 text-" + (colorDescription ? colorDescription : "primary")}>
                        {description}
                    </p>
                </React.Fragment>}
            </div>
    );
};

export default SmallInfoCard;
