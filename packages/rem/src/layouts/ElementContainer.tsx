import React from 'react';
import getRemfrom '../rem';
import type { IAuthority } from '../interface';

interface ElementProps {
  elementProps?: any;
  children: any;
  showNoMatch?: boolean;
}

const ElementContainer: React.FC<ElementProps & IAuthority> = (props) => {
  const { authority, children, showNoMatch } = props;

  const { checkAuthority, errorPage } = getRem().permission;

  if (checkAuthority(authority)) {
    return children;
  }
  return showNoMatch ? errorPage : <span />;
};

export { ElementProps };

export default ElementContainer;
