import React from 'react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';

export default function Index() {
  return (
    <PageContext.Provider value={{ activeItem: PAGE.INDEX }}>
      <Layout title="Vengleab Utilities" />
    </PageContext.Provider>
  );
}
