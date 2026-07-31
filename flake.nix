{
  description = "Squad Health Demo Flake";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0";

  outputs =
    { self, ... }@inputs:
    let
      inherit (inputs.nixpkgs) lib;

      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      forEachSupportedSystem =
        f:
        lib.genAttrs supportedSystems (
          system:
          f {
            inherit system;
            pkgs = import inputs.nixpkgs {
              inherit system;
              config.allowUnfree = true;
            };
          }
        );
    in
    {
      devShells = forEachSupportedSystem (
        { pkgs, system }:
        {
          default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              git
              pnpm
              prettier
              nodejs_22
              self.formatter.${system}
            ];
          shellHook = ''
            export PNPM_HOME="$PWD/.pnpm"
            export PATH="$PWD/node_modules/.bin:$PNPM_HOME:$PATH"
            export NEXT_TELEMETRY_DISABLED=1

            echo "squad health . node $(node --version) . pnpm $(pnpm --version)"
          '';
          };
        }
      );

      formatter = forEachSupportedSystem ({ pkgs, ... }: pkgs.nixfmt);
    };
}
