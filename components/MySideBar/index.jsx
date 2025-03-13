import React, { useContext } from "react";
import Link from "next/link";
import { Menu, } from "semantic-ui-react";
import { PAGE, MENU_ITEMS } from "../../constants/PageURL";
import PageContext from "../../contexts/page";

export default function MySideBar() {
  const { activeItem } = useContext(PageContext);
  return (
    <Menu inverted pointing vertical fluid>
      <div style={{"color": "white"}}>{activeItem}</div>
      {Object.entries(MENU_ITEMS).map(([key, value]) => (
        <Link href={value.page} key={key}>
          <Menu.Item name={value.name} active={value.page === activeItem} />
        </Link>
      ))}
    </Menu>
  );
}
