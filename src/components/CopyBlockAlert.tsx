import React, { useCallback, useMemo, useState } from "react";
import {
  InputGroup,
  Label,
} from "@blueprintjs/core";
import createOverlayRender from "roamjs-components/util/createOverlayRender";
import { render as renderToast } from "roamjs-components/components/Toast";
import GraphMessageAlert from "./GraphMessageAlert";

type Props = {
  blockUid: string;
};

const CopyBlockAlert = ({
  onClose,
  blockUid,
}: { onClose: () => void } & Props) => {
  const [page, setPage] = useState("");
  const block = useMemo(
    () =>
      window.roamAlphaAPI.q(
        `[:find (pull ?b [[:block/string :as "text"] :block/heading [:block/text-align :as "textAlign"]]) :where [?b :block/uid "${blockUid}"]]`
      )[0][0],
    [blockUid]
  );
  const onSubmit = useCallback(
    async (graph: string) => {
      window.roamjs.extension.multiplayer.sendToGraph({
        graph,
        operation: "COPY_BLOCK",
        data: { block, page, blockUid },
      });
      window.roamjs.extension.multiplayer.addGraphListener({
        operation: `COPY_BLOCK_RESPONSE/${blockUid}`,
        handler: (_, graph) => {
          window.roamjs.extension.multiplayer.removeGraphListener({
            operation: `COPY_BLOCK_RESPONSE/${blockUid}`,
          });
          renderToast({
            id: "copy-block-success",
            content: `Successfully sent block ${blockUid} to ${graph}!`,
          });
        },
      });
    },
    [page]
  );
  return (
    <GraphMessageAlert
      title={`Copy Block to Graph`}
      onClose={onClose}
      onSubmitToGraph={onSubmit}
      disabled={!page}
    >
      <Label>
        Page
        <InputGroup value={page} onChange={(e) => setPage(e.target.value)} />
      </Label>
    </GraphMessageAlert>
  );
};

export const render = createOverlayRender("copy-block-alert", CopyBlockAlert);

export default CopyBlockAlert;
