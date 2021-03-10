import React, { useEffect, useRef, useState } from 'react';
import useHandle from '../../hooks/useHandle';
import { Button, Input, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { IAuthority, RequestOptions } from '../../interface';
import type { SizeType } from 'antd/lib/config-provider/SizeContext';
import rem from '../../rem';
import './index.less';

export interface SimpleFormProps extends IAuthority {
  value: string | undefined;
  onSubmit?: <T>(values: any, onHandle: (params: RequestOptions) => Promise<T>) => Promise<T>;
  mode?: 'focus' | 'click';
  size?: SizeType;
  renderEdit?: (dom: React.ReactNode) => React.ReactNode;
}

export default function SimpleForm(props: SimpleFormProps) {
  const { mode, onSubmit, value, size, renderEdit, authority } = props;

  const { checkAuthority } = rem().permission;

  const { onHandle } = useHandle();

  const [edit, setEdit] = useState(false);
  const [showEdit, setShowEdit] = useState(true);
  const [inputValue, setInputValue] = useState<string>();

  const inputRef = useRef<any>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = () => {
    if (value === inputValue) {
      setEdit(false);
      setShowEdit(false);
    } else if (onSubmit) {
      onSubmit(inputValue, onHandle)
        .then(() => {
          setEdit(false);
          setShowEdit(false);
        })
        .catch(() => {});
    }
  };

  const onClickEdit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEdit(true);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const normalEdit = (
    <a className={'rem-simple-form-item-action'} onClick={onClickEdit}>
      <EditOutlined />
    </a>
  );

  return edit ? (
    <div className={'rem-simple-form-container'}>
      <Input
        ref={inputRef}
        size={size || 'small'}
        value={inputValue}
        style={{ visibility: edit ? 'visible' : 'hidden' }}
        onBlur={handleSubmit}
        onPressEnter={handleSubmit}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {mode === 'click' && (
        <div className={'rem-simple-form-item-action'}>
          <Space>
            <Button size={size || 'small'} onClick={() => setEdit(false)}>
              取消
            </Button>
            <Button size={size || 'small'} type={'primary'} onClick={handleSubmit}>
              确定
            </Button>
          </Space>
        </div>
      )}
    </div>
  ) : (
    <div
      className={'rem-simple-form-container'}
      onMouseLeave={() => {
        if (showEdit) setShowEdit(false);
      }}
      onMouseEnter={() => {
        setShowEdit(true);
      }}
    >
      <span style={{ display: 'inline-block' }}>{inputValue || rem().constants.DEFAULT_VALUE}</span>
      {showEdit && checkAuthority(authority) && (renderEdit?.(normalEdit) || normalEdit)}
    </div>
  );
}
