import React from "react";
import { useApp } from "../context/AppContext";
import SearchBanner from "./SearchBanner";
import ServicesList from "./ServicesList";
import TravelerProfileForm from "./TravelerProfileForm";

const MainContent = () => {
  const { currentCategory } = useApp();

  if (currentCategory === "perfilamiento") {
    return <TravelerProfileForm />;
  }

  return (
    <>
      <SearchBanner />
      <ServicesList />
    </>
  );
};

export default MainContent;
