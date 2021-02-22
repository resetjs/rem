import React from 'react';
import rem from '../rem';
import { IAuthority } from '../interface';

interface ElementProps {
  elementProps?: any,
  children: any
  showNoMatch?: boolean
}

const ElementContainer: React.FC<ElementProps & IAuthority> = (props) => {
  const { authority, children, showNoMatch } = props;

  const { checkAuthority, errorPage } = rem.permission;

  if (checkAuthority(authority)) {
    return children;
  }
  return showNoMatch ? errorPage : <span />;

};

export {
  ElementProps,
};

export default ElementContainer;
