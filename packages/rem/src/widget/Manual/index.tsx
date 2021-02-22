import React from 'react';
import './index.less';

export interface ManualProps {
  title?: string
  dataSource: { subTitle: string, content: string }[]
  type?: 'horizontal' | 'vertical' | 'inline' | undefined;
}

export default (props: ManualProps) => {
  const { title = '说明', dataSource = [], type } = props;

  return (
    <div className={`rem-manual-content rem-manual-content-${type || 'horizontal'}`}>
      <h3>{title}</h3>
      {
        dataSource.map((item: any, position) => <div key={item.subTitle || position}>
          <h4 key={item.subTitle}>{item.subTitle}</h4>
          <p key={item.content}>{item.content}</p>
        </div>)
      }
    </div>
  );
}


