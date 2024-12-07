import {Modal,Section} from "@telegram-apps/telegram-ui";
import {useEffect,useState} from "react";

import "@/pages/IndexPage/IndexPage.css";

let _modal: (props: { visible: boolean }) => void;

export const WithdrawModal = () => {
  const [visible, setVisible] = useState(false);
  const [header] = useState("Withdraw");
  useEffect(() => {
    _modal = ({ visible }: { visible: boolean }) => {
      setVisible(visible);
      // if (address) setAddress(address);
    };
  }, []);

  useEffect(() => {
    if (visible) window.scrollTo(0, 0);
  }, [visible]);

  return (
    <Modal open={visible} trigger={undefined} onOpenChange={setVisible}>
      <Section header={header}>
      </Section>
      {/* <div style={{marginBottom: '1rem'}}>
        <Button
          className="w-50"
          onClick={() => {
            resolveRef.current(false);
            setVisible(false);
          }}
        >
          {" "}
          Cancel
        </Button>
        <Button
          className="w-50"
          onClick={() => {
            resolveRef.current(true);
            setVisible(false);
          }}
        >
          Confirm
        </Button>
      </div> */}
    </Modal>
  );
};

export const withdrawModal = async (visible: boolean) => {
  _modal({ visible });
};
