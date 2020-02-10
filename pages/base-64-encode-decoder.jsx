import { Component } from "react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page"
import { PAGE } from "../constants/PageURL";

export default function Base64Decoder() {
  return (
    <PageContext.Provider value={{ activeItem: PAGE.BASE_64_ENCODE_DECODER }}>
      <Layout title="String Length" />
    </PageContext.Provider>
  );
}
