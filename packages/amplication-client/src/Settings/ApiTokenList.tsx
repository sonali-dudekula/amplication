import {
  Dialog,
  EnumPanelStyle,
  Panel,
  Snackbar,
  CircularProgress,
} from "@amplication/design-system";
import { gql, useQuery } from "@apollo/client";
import React, { useCallback, useState } from "react";
import { Button, EnumButtonStyle } from "../Components/Button";
import * as models from "../models";
import { formatError } from "../util/error";
import "./ApiTokenList.scss";
import { ApiTokenListItem } from "./ApiTokenListItem";
import NewApiToken from "./NewApiToken";

type TData = {
  userApiTokens: models.ApiToken[];
};

const CLASS_NAME = "api-token-list";

export const ApiTokenList = React.memo(() => {
  const [newTokenState, setNewTokenState] = useState<boolean>(false);
  const [newToken, setNewToken] = useState<models.ApiToken | null>(null);
  const [error, setError] = useState<Error>();
  const [tokenCopied, setTokenCopied] = useState<boolean>(false);

  const handleNewTokenClick = useCallback(() => {
    setNewTokenState(!newTokenState);
  }, [newTokenState, setNewTokenState]);

  const handleNewTokenCompleted = useCallback(
    (token: models.ApiToken) => {
      setNewToken(token);
      setNewTokenState(false);
      setTokenCopied(false);
    },
    [setNewToken, setNewTokenState]
  );

  const handleCopyToken = async () => {
    const token = data?.userApiTokens[0].token;
    if (!token) {
      console.log("Token does not exist");
      return;
    }
    await navigator.clipboard.writeText(token);
    setTokenCopied(true);
  }

  const { data, loading, error: errorLoading } = useQuery<TData>(
    GET_API_TOKENS
  );

  const errorMessage =
    formatError(errorLoading) || (error && formatError(error));

  return (
    <>
      <Dialog
        className="new-entity-dialog"
        isOpen={newTokenState}
        onDismiss={handleNewTokenClick}
        title="New API Token"
      >
        <NewApiToken onCompleted={handleNewTokenCompleted} />
      </Dialog>
      <div className={`${CLASS_NAME}__header`}>
        <h2>API Tokens</h2>
        <Button
          className={`${CLASS_NAME}__add-button`}
          buttonStyle={EnumButtonStyle.Primary}
          onClick={handleNewTokenClick}
          icon="plus"
        >
          Create API Token
        </Button>
      </div>
      <div className={`${CLASS_NAME}__message`}>
        API tokens are used to authenticate requests to Amplication API,
        specifically it is required to use Amplication CLI.
        <br />
        Tokens are valid for 30 days from creation or last use, so that the 30
        day expiration automatically refreshes with each API call.
      </div>

      {newToken && (
        <Panel
          className={`${CLASS_NAME}__new-token`}
          panelStyle={EnumPanelStyle.Bordered}
        >
          <div className={`${CLASS_NAME}__new-token-message`}>
            Make sure to copy your new API token now. You won't be able to see it
            again.<br />
          </div>
          <Button
            className={`${CLASS_NAME}__add-button`}
            buttonStyle={!tokenCopied ? EnumButtonStyle.Primary : EnumButtonStyle.Clear}
            onClick={handleCopyToken}
            icon={!tokenCopied ? "copy" : "check"}
            disabled={tokenCopied}
          >
            {!tokenCopied ? "Copy Token" : "Copied To Clipboard"}
          </Button>
        </Panel>
      )}

      {loading && <CircularProgress />}
      {data?.userApiTokens.map((token) => (
        <ApiTokenListItem
          key={token.id}
          applicationId={"data?.entity.appId"}
          apiToken={token}
          onError={setError}
        />
      ))}
      <Snackbar open={Boolean(error || errorLoading)} message={errorMessage} />
    </>
  );
});

export const GET_API_TOKENS = gql`
  query userApiTokens {
    userApiTokens {
      id
      createdAt
      updatedAt
      name
      token
      previewChars
      lastAccessAt
      userId
    }
  }
`;
