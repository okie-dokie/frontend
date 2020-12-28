import React, { lazy } from "react";
import Notes from "../../../Notes/Notes";

import NewSubjectForm from "../../../Routes/Forms/NewSubjectForm/NewSubjectForm";

const Home = lazy(() => import("../../../Routes/Home/Home"));

export function handleFirstSubjectRoute({ location: { state }, history }) {
  if (!state || !state.firstSubject) {
    // This page should only be accessible instantly after the user signs up, so reroute otherwise
    return { reroute: "home", history, ...state };
  }
  return {
    history,
    ...state,
  };
}

export function handleHomeRoute(renderProps, props) {
  const {
    authInfo: {
      user: { defaultSubject },
    },
  } = props;
  // This is when no subject has yet been created - should only run after signup
  if (!defaultSubject) {
    return { error: "no subject", ...renderProps, ...props };
  }
  return {
    ...renderProps,
    ...props,
  };
}

function getLocation(props) {
  return props?.history?.location?.pathname;
}

export function renderFunction(renderProps, props) {
  const properties = handleHomeRoute(renderProps, props);

  if (properties.error === "no subject") {
    return <NewSubjectForm {...properties} />;
  }
  switch (getLocation(properties)) {
    case "/":
      return <Home {...properties} />;
    case "/notes":
      return <Notes {...properties} />;
    default:
      return <Home {...properties} />;
  }
}
