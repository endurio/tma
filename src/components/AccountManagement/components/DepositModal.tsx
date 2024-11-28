import { Cell, Modal, Section } from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";

import "@/pages/IndexPage/IndexPage.css";

let _modal: (props: { visible: boolean; depositAddress?: string }) => void;

export const DepositModal = () => {
  const [visible, setVisible] = useState(false);
  const [header] = useState("Deposit");
  const [depositAddress, setDepositAddress] = useState("Are you sure?");
  useEffect(() => {
    _modal = ({
      visible,
      depositAddress,
    }: {
      visible: boolean;
      depositAddress?: string;
    }) => {
      setVisible(visible);
      if (depositAddress) setDepositAddress(depositAddress);
    };
  }, []);

  useEffect(() => {
    if (visible) window.scrollTo(0, 0);
  }, [visible]);

  return (
    <Modal open={visible} trigger={undefined} onOpenChange={setVisible}>
      <Section header={header}>
        <Cell>
          {depositAddress.split("\n").map((line) => (
            <p>{line}</p>
          ))}
        </Cell>
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

export const depositModal = async (
  visible: boolean,
  depositAddress: string
) => {
  _modal({ visible, depositAddress });
};
