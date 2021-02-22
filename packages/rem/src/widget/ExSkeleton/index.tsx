import { Spin } from 'antd';
import React from 'react';


export interface ExSkeletonProps {
  active?: boolean
  showLoading?: boolean
}

const ExSkeleton: React.FC<ExSkeletonProps> = (props) => {
  const { children, active = true, showLoading = false } = props;
  return active
    ? <Spin style={{ width: '100%' }} spinning={showLoading} delay={500}>{children}</Spin>
    : <span />;
};

export default ExSkeleton;
