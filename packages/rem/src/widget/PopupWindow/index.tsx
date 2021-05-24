import {Drawer, Modal} from "antd";
import {ReactNode} from "react";

interface PopupWindowProps {
    mode: 'modal' | 'drawer'
    children: ReactNode
    onClose: () => void
    visible: boolean
    maskClosable: boolean
    title?: string
}

export default function PopupWindow(props: PopupWindowProps) {

    const {
        visible = false,
        maskClosable = true,
        mode,
        children,
        onClose,
        ...rest
    } = props;

    switch (mode) {
        case "drawer":
            return <Drawer
                    placement="right"
                    maskClosable={maskClosable}
                    destroyOnClose
                    visible={visible}
                    onClose={onClose}
                    {...rest}>{children}</Drawer>
        default:
            return <Modal
                    destroyOnClose={true}
                    maskClosable={false}
                    onCancel={onClose}
                    {...rest}>{children}</Modal>
    }
}