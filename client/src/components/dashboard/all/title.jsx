import React, { Component } from 'react';
import Helmet from 'react-helmet';

const TitleFunction = ({ title }) => {
    let defaultTitle = 'App';
    return (
        <Helmet>
            <title>{ title || defaultTitle}</title>
        </Helmet>
    );
};

// withTitle function
export default ({ component: Inner, title }) => {
    return class Title extends Component {
        render() {
            return (
                <React.Fragment>
                    <TitleFunction title={title} />
                    <Inner {...this.props} />
                </React.Fragment>
            );
        }
    };
  };

