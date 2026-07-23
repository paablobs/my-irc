# Contributing

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- ES Modules
- Small, focused files
- Descriptive naming

## Principles

1. **Single Responsibility**: Each class/function does one thing
2. **Dependency Inversion**: Depend on abstractions, not implementations
3. **Interface Segregation**: Keep interfaces small and focused
4. **Composition**: Prefer composition over inheritance
5. **Immutability**: Use readonly where possible

## Pull Request Process

1. Create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Ensure TypeScript compiles
5. Ensure linting passes
6. Update documentation if needed
7. Submit PR

## Testing

- Unit tests for all modules
- Integration tests for critical paths
- Use Vitest for testing framework
- Aim for high coverage on business logic

## Documentation

- Update docs when architecture changes
- Add JSDoc comments to public APIs
- Keep README.md up to date
- Document any breaking changes

## Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor" not "Moves cursor")
- Limit first line to 72 characters
- Reference issues and pull requests

## Areas for Contribution

- Additional IRC commands
- IRCv3 support
- TLS encryption
- Database persistence
- Performance optimization
- Test coverage
- Documentation
