# 📝 Contribution Guide - Dataviz

First of all, **thank you** for taking the time to contribute! It's thanks to passionate people like you that this project can grow and stay performant.

By contributing to this project, you agree that your modifications will be submitted under the **AGPL-3.0** license.

---

## 🎯 Our philosophy

We want this SaaS to be **free, performant, and accessible**. Using AGPL ensures that all improvements made to the code benefit the entire community.

> **Author's note:** I'm particularly attentive to optimizations (performance, security, clean code). If you see a way to make the application lighter or faster, your suggestions are more than welcome!

---

## 🛠 How to contribute?

### 1. Report a bug or suggest a feature

Before opening a ticket, please check if the topic isn't already listed in [Issues](https://github.com/ton-pseudo/ton-repo/issues).
* **Bug:** Use the `bug` tag and describe the steps to reproduce it.
* **Idea:** Use the `enhancement` tag to discuss a new feature.

### 2. Submit code (Pull Request)

To have your contribution integrated quickly, follow these steps:

1. **Fork** the repository and create your branch: `git checkout -b feature/my-awesome-improvement`.
2. **Code** with love (while respecting the existing code style).
3. **Test** your changes to avoid regressions.
4. **Commit** clearly: `git commit -m "feat: add image compression"`.
5. **Open a Pull Request** explaining the "why" behind your changes.

---

## 💡 Tips for a great contribution

* **Optimization:** If your change reduces CPU or RAM consumption, mention it! That's what we're looking for first.
* **Documentation:** If you add a feature, don't forget to update the corresponding documentation.
* **Modularity:** Try to keep your functions small and reusable.

---

## 🏗 Quick development setup

To run the project locally and start coding:

```bash
# 1. Clone your fork
git clone ...

# 2. Install dependencies
pnpm install

# 3. Configure the environment (e.g. copy .env.example)
cp .env.example .env

# 4. Run in dev mode
pnpm run dev
```
