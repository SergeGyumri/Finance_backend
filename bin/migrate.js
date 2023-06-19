import {
  Users, BalanceHistory, RepeatedBalances, Notifications,
} from '../models';

async function main() {
  for (const Model of [
    Users, BalanceHistory, RepeatedBalances, Notifications,
  ]) {
    await Model.sync({ alter: true });
  }
  process.exit(0);
}

main().catch(console.error);
