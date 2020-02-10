import React from "react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";

export default function JSON_Beautifier() {
  return (
    <PageContext.Provider value={{ activeItem: PAGE.JSON_BEAUTIFIER }}>
      <Layout title="Vengleab Utilities" />
    </PageContext.Provider>
  );
}
