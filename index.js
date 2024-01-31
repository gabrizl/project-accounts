//modulos externos
import inquirer from "inquirer";
import chalk from "chalk";
//modulos internos
import fs from "fs";
import { error, log } from "console";
import { get } from "http";
import { parse } from "path";

console.log("inciamos o Accounts");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que voce deseja fazer",
        choices: [
          "criar conta",
          "consultar saldo",
          "depositar",
          "sacar",
          "sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      if (action === "criar conta") {
        createAccount();
      } else if (action == "consultar saldo") {
        getAccountBalance();
      } else if (action == "depositar") {
        deposit();
      } else if (action == "sacar") {
        withdraw();
      } else if ((action = "sair")) {
        console.log(chalk.bgBlue.black("obrigado por usar o Accounts!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

function createAccount() {
  console.log(chalk.bgGreen.black("parabens por escolher o nosso banco"));
  console.log(chalk.green("defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      { name: "accountName", message: "digite um nome para a sua conta:" },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        chalk.bgRed.black("Esta conta já existe, escolha outro nome!"),
          buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green("Parabéns, a sua conta foi criada!"));
    })
    .catch((err) => console.log(err));
}

//add an amount to user amount
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          //add an amount
          addAmount(accountName, amount);
          operation();
        });
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black("Esta conta não existe, esolha outro nome!"));
    return false;
  }

  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("ocorreu um erro, tente novamente mais tarde!")
    );

    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`foi depositado o valor de R$${amount} na sua conta!`)
  );
}

function getAccount(accountName) {
  const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJson);
}

//show account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      //verify if account exists
      if (!checkAccount(accountName)) {
        return getAccountBalance;
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `Olá o saldo da sua conta é de R$${accountData.balance}`
        )
      );
      operation();
    })
    .catch((err) => console.log(err));
}

//withdraw an amount from a account
function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "qual o nome da sua conta",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          removeAmount(accountName, amount);
        });
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde")
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponivel!"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`)
  );
  operation();
}
