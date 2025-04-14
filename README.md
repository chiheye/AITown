# AI Town

AI Town is an interactive 3D simulation game where you can build and manage your own futuristic town with AI-powered interactions. Construct buildings, manage resources, and communicate with AI characters to develop your thriving community.

<img width="1059" alt="Screenshot 2025-04-14 at 1 16 13 PM" src="https://github.com/user-attachments/assets/54a5b168-2fd8-4cfa-aef1-6a538b9c3cbd" />


## Features

- **Interactive 3D Environment**: Explore a fully rendered 3D world with dynamic lighting, water effects, and vegetation.
- **Town Building**: Construct various buildings including houses, farms, factories, and research labs.
- **Resource Management**: Balance your town's money, population, food, and energy resources.
- **AI-Powered Characters**: Interact with AI characters who have unique personalities and roles.
- **Dynamic Chat System**: Communicate with your town's residents and buildings using natural language.
- **Customizable LLM Integration**: Configure your own AI model for more advanced interactions.

## Technologies Used

- Next.js (App Router)
- React Three Fiber (Three.js)
- Tailwind CSS
- shadcn/ui components
- OpenAI API (optional)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chiheye/AITown.git
   cd ai-town
   ```

2. Install dependencies:
   ```bash
   pnpm i
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Basic Controls

- **Camera Navigation**: Left-click and drag to rotate the camera, right-click and drag to pan, and use the scroll wheel to zoom in and out.
- **Building Construction**: Click on the "Build" tab in the bottom-left panel to construct new buildings.
- **Character Interaction**: Click on characters to initiate conversations with them.
- **Building Management**: Click on buildings to view details and upgrade options.

### Game Mechanics

- Each building serves a different purpose and costs resources to construct and upgrade.
- Your town's population will grow as you expand your housing capacity.
- Resources are generated automatically over time based on your buildings.
- Interact with AI characters to get advice and learn about your town's status.

## LLM Configuration

AI Town supports integration with Large Language Models (LLMs) for more advanced AI interactions:

1. Click the "Configure LLM" button in the top-right corner.
2. Enter your API key and select your preferred model.
3. Test the connection to ensure everything is working correctly.
4. Save your configuration to enable AI-powered conversations.

You can use the built-in mock mode if you don't have an API key, which provides simulated responses.

### Supported LLM Providers

- OpenAI (GPT models)
- Custom API endpoints (compatible with OpenAI API format)

## Project Structure

```
ai-town/
├── app/                  # Next.js app directory
├── components/           # React components
│   ├── environment/      # 3D environment components
│   ├── town/             # Town-related components
│   └── ui/               # User interface components
├── context/              # React context providers
├── services/             # Service functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
    ├── models/           # 3D models
    └── textures/         # Textures for 3D models
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js and React Three Fiber for 3D rendering
- shadcn/ui for UI components
- OpenAI for AI capabilities
