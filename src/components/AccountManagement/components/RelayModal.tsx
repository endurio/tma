import "@/pages/IndexPage/IndexPage.css";
import "./index.css";
import { useEffect, useState } from "react";
import { Button, Modal } from "@telegram-apps/telegram-ui";
import {useConfigs} from "@/hook/useConfigs";
import {useEndurioContract} from "@/hook/useEndurioContract";
let _modal: (props: { visible: boolean }) => void;

export const RelayModal = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    _modal = ({ visible }: { visible: boolean }) => {
      setVisible(visible);
    };
  }, []);
  const {configs} = useConfigs()
  const {performRelay} = useEndurioContract()
  useEffect(() => {
    performRelay()
  },[configs])
  return (
    <Modal open={visible} trigger={undefined} onOpenChange={setVisible}>
      abcxyz
      {/* <Button onClick={() => {    performRelay()}}>abv</Button> */}
    </Modal>
  );
};

export const relayModal = async (visible: boolean) => {
  _modal({ visible });
};
