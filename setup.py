import os

# Define folder structure
structure = {
    "ai-interview-tracker": {
        "apps": {
            "frontend": {
                "app": {
                    "dashboard": {},
                    "practice": {},
                    "ai": {},
                },
                "components": {},
                "store": {},
                "lib": {},
                "hooks": {},
                "styles": {},
            },
            "backend": {
                "src": {
                    "controllers": {},
                    "routes": {},
                    "models": {},
                    "middleware": {},
                    "services": {},
                    "utils": {},
                    "config": {},
                }
            },
        },
        "packages": {
            "ui": {},
            "config": {},
            "types": {},
        },
    }
}

# Files to create
files = [
    "ai-interview-tracker/.env.example",
    "ai-interview-tracker/package.json",
    "ai-interview-tracker/README.md",
    "ai-interview-tracker/docker-compose.yml",

    "ai-interview-tracker/apps/backend/package.json",
    "ai-interview-tracker/apps/backend/tsconfig.json",
    "ai-interview-tracker/apps/backend/src/server.ts",

    "ai-interview-tracker/apps/frontend/app/page.tsx",
    "ai-interview-tracker/apps/frontend/app/layout.tsx",
]

def create_structure(base_path, tree):
    for name, subtree in tree.items():
        path = os.path.join(base_path, name)
        os.makedirs(path, exist_ok=True)
        create_structure(path, subtree)

def create_files():
    for file_path in files:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write("")  # empty file

if __name__ == "__main__":
    create_structure(".", structure)
    create_files()
    print("✅ Project structure created successfully!")