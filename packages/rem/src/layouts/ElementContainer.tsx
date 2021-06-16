import React from 'react';
import {permission} from '../rem';
import type { IAuthority } from '../interface';

interface ElementProps {
  elementProps?: any;
  children: any;
  showNoMatch?: boolean;
}

const ElementContainer: React.FC<ElementProps & IAuthority> = (props) => {
  const { authority, children, showNoMatch } = props;

  const { checkAuthority, errorPage } = permission;

  if (checkAuthority(authority)) {
    return children;
  }
  return showNoMatch ? errorPage : <span />;
};

export { ElementProps };

export default ElementContainer;
