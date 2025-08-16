# Eco Doggy Ecommerce

Eco Doggy Ecommerce is an e-commerce application designed to provide eco-friendly technology, food, and healthy products for dogs. This project aims to create a user-friendly platform for dog owners to find sustainable and healthy options for their pets.

## Features

- User authentication and management
- Product catalog with eco-friendly dog products
- Shopping cart functionality
- Secure checkout process
- Responsive design for mobile and desktop users

## Project Structure

```
eco-doggy-ecommerce
├── app
│   ├── __init__.py
│   ├── models.py
│   ├── routes.py
│   ├── templates
│   │   └── base.html
│   └── static
│       └── style.css
├── requirements.txt
├── config.py
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/eco-doggy-ecommerce.git
   cd eco-doggy-ecommerce
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Set up the configuration in `config.py` with your database details and other settings.
2. Run the application:
   ```
   flask run
   ```
3. Open your web browser and go to `http://127.0.0.1:5000` to access the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.