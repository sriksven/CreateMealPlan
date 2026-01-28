# Virtual Environment Setup Guide

This guide explains how to set up the Python virtual environment for the CreateMealPlan project using `pyenv`.

## Prerequisites

- **pyenv**: Ensure `pyenv` is installed and configured on your system.
- **Python**: This project uses Python 3.12.9.

## Steps to Replicate

1.  **Install Python 3.12.9**:
    ```bash
    pyenv install 3.12.9
    ```

2.  **Create the Virtual Environment**:
    Create a new virtual environment named `createmealplan` using the installed Python version:
    ```bash
    pyenv virtualenv 3.12.9 createmealplan
    ```

3.  **Activate the Environment**:
    Navigate to the project root and set the local version:
    ```bash
    pyenv local createmealplan
    ```
    This creates a `.python-version` file, ensuring the environment activates automatically when you enter the directory.

4.  **Install Requirements**:
    With the environment active, install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Verification

Run the following command to verify the installation:
```bash
python -c "import google.generativeai; print('Environment Setup Complete')"
```
