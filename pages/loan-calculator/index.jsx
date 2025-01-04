import {
  Form,
  Segment,
  Header,
  Input,
  Dropdown,
  Statistic,
  Icon,
  Grid,
  Table,
} from 'semantic-ui-react';
import { useState } from 'react';
import FormatNumber from 'format-number';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import moment from 'moment';
import Layout from '../../components/Layout';
import PageContext from '../../contexts/page';
import { PAGE } from '../../constants/PageURL';
import './index.module.css';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import InputMast from '../../components/InputMask';

const TERM = {
  MONTHLY: 'month',
  YEARLY: 'year',
};
const DollarFormatter = FormatNumber({ prefix: '$ ', round: 2 });
const options = Object.entries(TERM).map(([key, value]) => ({ key, value, text: key }));

function EMICalculator({
  principle, monthlyRate, totalMonths,
}) {
  // eslint-disable-next-line max-len
  return (principle * monthlyRate * (1 + monthlyRate) ** totalMonths) / ((1 + monthlyRate) ** totalMonths - 1);
}

function getTotalMonths(period, term) {
  return (term === TERM.MONTHLY ? period : period * 12);
}

function getMonthRate(rate, term) {
  return (term === TERM.MONTHLY ? rate : rate / 12);
}

function toOrdinalNumber(number) {
  switch (number) {
    case 1:
      return '1st';
    case 2:
      return '2nd';
    default:
      return `${number}th`;
  }
}

function generatePaymentTable({
  principle, emi, monthlyRate, totalMonths,
}) {
  let remain = principle;
  const table = [];
  // eslint-disable-next-line no-plusplus
  for (let month = 0; month < totalMonths; month++) {
    const interest = remain * monthlyRate;
    const row = {
      principle: remain,
      remain: (remain -= emi - interest),
      interest,
    };
    table.push(row);
  }
  return table;
}

export default function LoadCalculator() {
  const [principle, setPrinciple] = useState();
  const [rate, setRate] = useState();
  const [period, setPeriod] = useState();
  const [term, setTerm] = useState(TERM.YEARLY);
  const totalMonths = getTotalMonths(period, term);
  const monthlyRate = getMonthRate(rate, term) / 100;
  const emi = EMICalculator({ principle, monthlyRate, totalMonths });
  const [startPayingDate, setStartPayingDate] = useState(new Date());
  const onChange = (event, data) => setStartPayingDate(data.value);

  return (
    <PageContext.Provider value={{ activeItem: PAGE.LOAN_CALCULATOR }}>
      <Layout title="Loan Calculator">
        <Segment>
          <Header as="h3" style={{ paddingBottom: 20, textAlign: 'center' }}>
            EMI (Equated monthly installment) Calculator for Home Loan, Car Loan & Personal Loan
          </Header>
          <Grid>
            <Grid.Row divided>
              <Grid.Column computer={7} mobile={16}>
                <Form>
                  <Form.Field>
                    <InputMast
                      label={{
                        color: 'teal',
                        content: 'Principle ( Loan amount )',
                      }}
                      mask={{ prefix: '$ ', allowDecimal: true }}
                      onChange={setPrinciple}
                      placeholder="Amount you take from Finance institute"
                    />
                  </Form.Field>
                  <Form.Field>
                    <InputMast
                      action={
                        <Dropdown
                          button
                          basic
                          floating
                          options={options}
                          defaultValue={term}
                          onChange={(_, { value }) => {
                            setTerm(value);
                          }}
                        />
                      }
                      label={{
                        color: 'teal',
                        labelPosition: 'left',
                        content: 'Rate (%)',
                      }}
                      mask={{ prefix: '', suffix: ' %', allowDecimal: true }}
                      onChange={setRate}
                      labelPosition="left"
                      placeholder="Year / Monthly Rate"
                    />
                  </Form.Field>
                  <Form.Field>
                    <InputMast
                      label={{
                        color: 'teal',
                        labelPosition: 'left',
                        content: 'Period ( Years / Months )',
                        width: '50px',
                      }}
                      onChange={setPeriod}
                      labelPosition="left"
                      placeholder="Total Period"
                      mask={{
                        prefix: '',
                        suffix: ` ${term}`,
                        allowDecimal: true,
                      }}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Input
                      label={{
                        color: 'teal',
                        labelPosition: 'left',
                        content: 'Start Date ( Optional )',
                        width: '50px',
                      }}
                      input={(props) => (
                        <div className="date-picker">
                          <SemanticDatepicker {...props} inverted onChange={onChange} />
                        </div>
                      )}
                    ></Input>
                  </Form.Field>
                </Form>
              </Grid.Column>
              <Grid.Column computer={9} mobile={16}>
                <Statistic.Group size="mini" className="result">
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Monthly payment <br />
                      &nbsp;
                    </Statistic.Label>
                    <Statistic.Value>{!Number.isNaN(emi) ? DollarFormatter(emi) : '--'}</Statistic.Value>
                  </Statistic>
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Total months
                      <br />
                      &nbsp;
                    </Statistic.Label>
                    <Statistic.Value>{!Number.isNaN(emi) ? totalMonths : '--'}</Statistic.Value>
                  </Statistic>
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Total Payment <br />
                      (Principal + Interest)
                    </Statistic.Label>
                    <Statistic.Value>
                      {!Number.isNaN(emi) ? DollarFormatter(totalMonths * emi) : '--'}
                    </Statistic.Value>
                  </Statistic>
                </Statistic.Group>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Table inverted stackable size="large">
                <Table.Header>
                  <Table.Row textAlign="center">
                    <Table.HeaderCell># No (payment)</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Remaining</Table.HeaderCell>
                    <Table.HeaderCell>Monthly payment</Table.HeaderCell>
                    <Table.HeaderCell>Principle</Table.HeaderCell>
                    <Table.HeaderCell>Interest</Table.HeaderCell>
                    <Table.HeaderCell>Remain Balance</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {!Number.isNaN(emi)
                    && generatePaymentTable({
                      principle,
                      monthlyRate,
                      emi,
                      totalMonths,
                    }).map((row, index) => (
                      <Table.Row textAlign="center" key={index}>
                        <Table.Cell>
                          {toOrdinalNumber(index + 1)} (
                          {toOrdinalNumber(Math.ceil((index + 1) / 12))} year)
                        </Table.Cell>
                        <Table.Cell>
                          {moment(startPayingDate)
                            .add(index, 'months')
                            .format('DD MMM YYYY')}
                        </Table.Cell>
                        <Table.Cell>{DollarFormatter(row.principle)}</Table.Cell>
                        <Table.Cell>{DollarFormatter(emi)}</Table.Cell>
                        <Table.Cell>{DollarFormatter(emi - row.interest)}</Table.Cell>
                        <Table.Cell>{DollarFormatter(row.interest)}</Table.Cell>
                        <Table.Cell>{DollarFormatter(row.remain)}</Table.Cell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table>
            </Grid.Row>
          </Grid>
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
