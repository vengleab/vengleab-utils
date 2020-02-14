import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";
import { Segment, Grid, Form, Button, Divider, Icon, TextArea } from "semantic-ui-react";

export default function JSON_Beautifier() {
  return (
    <PageContext.Provider value={{ activeItem: PAGE.JSON_BEAUTIFIER }}>
      <Layout title="Vengleab Utilities">
        <Segment>
          <Grid columns={2} relaxed="very" stackable>
            <Grid.Column>
              <Form>
                <TextArea placeholder='Tell us more' style={{ minHeight: 500 }} />
              </Form>
            </Grid.Column>

            <Grid.Column verticalAlign="middle" stackable>
            <Form>
              <TextArea placeholder='Tell us more' style={{ minHeight: 500 }} />
            </Form>
            </Grid.Column>
          </Grid>

          <Divider vertical>
            <Button><Icon name="long arrow alternate right" /></Button>
            <br/>
            <br/>
            <Button><Icon name="long arrow alternate left" /></Button>
          </Divider>
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
