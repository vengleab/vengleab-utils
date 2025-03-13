import {
  Form,
  Segment,
  Statistic,
  Icon,
  Grid,
  Divider,
} from "semantic-ui-react";
import { useEffect, useState } from "react";
import FormatNumber from "format-number";
import InputMast from "../../components/InputMask";
import Layout from "../../components/Layout";
import PageContext from "../../contexts/page";
import { PAGE } from "../../constants/PageURL";

const DollarFormatter = FormatNumber({ prefix: "$ ", round: 2 });

export default function JSONBeautifier() {
  const [net, setNetSalary] = useState(0);
  const [grossSalary, setGrossSalary] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(4000);
  const brackets = [
    { limit: 1500000 / exchangeRate, rate: 0 },
    { limit: 2000000 / exchangeRate, rate: 0.05 },
    { limit: 8500000 / exchangeRate, rate: 0.1 },
    { limit: 12500000 / exchangeRate, rate: 0.15 },
    { limit: Infinity, rate: 0.2 },
  ];

  function calculateNetSalary(grossSalary) {
    let netSalary = grossSalary;
    let prevLimit = 0;
    for (let i = 0; i < brackets.length; i += 1) {
      const { limit, rate } = brackets[i];

      if (grossSalary > prevLimit) {
            if (grossSalary > limit) {
          const tax = (limit - prevLimit) * rate;
          netSalary -= tax;
        } else {
          const tax = (grossSalary - prevLimit) * rate;
          netSalary -= tax;
        }
      } else {
        return netSalary;
      }
      prevLimit = limit;
    }
    return grossSalary;
  }

  useEffect(() => {
    setNetSalary(calculateNetSalary(grossSalary));
  }, [grossSalary, exchangeRate]);

  return (
    <PageContext.Provider value={{ activeItem: PAGE.KH_SALARY_TAX_CALCULATOR_GROSS }}>
      <Layout title="JSON Beautifier">
        <Segment>
          <Grid>
            <Grid.Row divided>
              <Grid.Column computer={7} mobile={16}>
                <Form>
                  <Form.Field>
                    <InputMast
                      label={{
                        color: "teal",
                        content: "Gross Salary",
                      }}
                      value={grossSalary || 0}
                      mask={{ prefix: "$ ", allowDecimal: true }}
                      onChange={setGrossSalary}
                      placeholder="Amount you expect from your employer"
                    />
                  </Form.Field>
                  <Form.Field>
                    <InputMast
                      label={{
                        color: "teal",
                        content: "Exchange Rage",
                      }}
                      mask={{ prefix: "KHR " }}
                      value={exchangeRate || 0}
                      onChange={setExchangeRate}
                      placeholder="Exchange Rate"
                    />
                  </Form.Field>
                </Form>
              </Grid.Column>
              <Grid.Column computer={9} mobile={16}>
                <Statistic.Group size="mini" className="result">
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Gross Salary <br />
                      &nbsp;
                    </Statistic.Label>
                    <Statistic.Value>
                      {!Number.isNaN(grossSalary)
                        ? DollarFormatter(grossSalary)
                        : "--"}
                    </Statistic.Value>
                  </Statistic>
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Net Salary
                      <br />
                      &nbsp;
                    </Statistic.Label>
                    <Statistic.Value>
                      {!Number.isNaN(net) ? DollarFormatter(net) : "--"}
                    </Statistic.Value>
                  </Statistic>
                </Statistic.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider />
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
