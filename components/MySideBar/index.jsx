import React, { useState, useContext } from "react";
import Link from "next/link";
import { Menu } from "semantic-ui-react";
import { PAGE } from "../../constants/PageURL";
import PageContext from "../../contexts/page";

const menuItems = {
  str_len: { name: "String Length", page: PAGE.STRING_LEN },
  base_64_encode_decoder: { name: "Base 64 encode and decoder", page: PAGE.BASE_64_ENCODE_DECODER },
  json_beautifier: { name: "JSON Beautifier", page: PAGE.JSON_BEAUTIFIER }
};

export default function MySideBar() {
  const { activeItem } = useContext(PageContext);
  return (
    <Menu inverted pointing vertical fluid>
      {Object.entries(menuItems).map(([key, value]) => (
        <Link href={value.page} key={key}>
          <Menu.Item name={value.name} active={value.page === activeItem} />
        </Link>
      ))}
    </Menu>
  );
}
