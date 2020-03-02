import dynamic from 'next/dynamic'
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import Demo from "../components/demo";

// use the component in your app!


export default function JSONBeautifier() {
  return (
    <PageContext.Provider value={{ activeItem: PAGE.JSON_BEAUTIFIER }}>
      <Layout title="Vengleab Utilities">
        <Demo/>
      </Layout>
    </PageContext.Provider>
  );
}
