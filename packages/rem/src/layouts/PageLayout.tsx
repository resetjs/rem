import React from 'react';
import type { ExSkeletonProps } from '../widget/ExSkeleton';
import ExSkeleton from '../widget/ExSkeleton';
import type { AuthorityRule } from '../interface';
import ElementContainer from './ElementContainer';
import type { PageContainerProps } from '@ant-design/pro-layout';
import { PageContainer } from '@ant-design/pro-layout';
// @ts-ignore
import { useModel } from 'umi';

interface PageLayoutProps extends ExSkeletonProps {
  authority?: string | string[] | AuthorityRule
  pageContainer?: boolean
  pageProps?: PageContainerProps
}

const PageLayout: React.FC<PageLayoutProps> = (props) => {
  const { authority, children, pageContainer = true, pageProps, ...other } = props;

  const content = (
    <ElementContainer authority={authority}>
      <ExSkeleton {...other}>{children}</ExSkeleton>
    </ElementContainer>
  );

  return pageContainer ? <PageContainer {...pageProps}>{content}</PageContainer> : content;
};

export {
  PageLayoutProps,
};

export default PageLayout;
