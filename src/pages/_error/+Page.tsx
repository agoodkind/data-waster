// /pages/_error/+Page.ts

import safeStringify from "@util/safe-stringify";
import { usePageContext } from "vike-react/usePageContext";

const ErrorWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className={"flex flex-col items-center justify-center h-screen"}>
    {children}
  </div>
);

function Page() {
  const pageContext = usePageContext();

  // if dev render generic error message
  if (!import.meta.env.DEV) {
    return (
      <ErrorWrapper>
        <p>Something went wrong. Try again.</p>
      </ErrorWrapper>
    );
  }

  const { abortReason, abortStatusCode, is404 } = pageContext;

  return (
    <ErrorWrapper>
      <p>abortReason: {safeStringify(abortReason)}</p>
      <p>abortStatusCode: {safeStringify(abortStatusCode)}</p>
      <p>is404: {safeStringify(is404)}</p>
      <p>pageContext: {safeStringify(pageContext)}</p>
    </ErrorWrapper>
  );
}

export default Page;
