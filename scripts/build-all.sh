#!/bin/bash
#
# Build All Docker Images for AutolytiQ
# Usage: ./build-all.sh [tag]
#

set -e

TAG=${1:-latest}
REGISTRY=${REGISTRY:-registry.digitalocean.com/autolytiq}

echo "========================================="
echo "🐳 Building All Docker Images"
echo "========================================="
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo ""

# Function to build and tag image
build_image() {
    local name=$1
    local context=$2
    local dockerfile=$3

    echo ""
    echo "Building $name..."
    echo "  Context: $context"
    echo "  Dockerfile: $dockerfile"
    echo ""

    docker build \
        -t $REGISTRY/$name:$TAG \
        -t $REGISTRY/$name:latest \
        -f $dockerfile \
        $context

    echo "✅ Built $REGISTRY/$name:$TAG"
}

# Build frontend
build_image "frontend" "." "apps/client/Dockerfile"

# Build backend
build_image "backend" "." "apps/server/Dockerfile"

# Build pricing-rust
build_image "pricing-rust" "services/rust" "services/rust/Dockerfile"

echo ""
echo "========================================="
echo "📊 Build Summary"
echo "========================================="
echo ""
echo "Images built:"
docker images | grep $REGISTRY | grep $TAG

echo ""
echo "========================================="
echo "🚀 Next Steps"
echo "========================================="
echo ""
echo "To push images to registry:"
echo "  docker login $REGISTRY"
echo "  docker push $REGISTRY/frontend:$TAG"
echo "  docker push $REGISTRY/backend:$TAG"
echo "  docker push $REGISTRY/pricing-rust:$TAG"
echo ""
echo "Or push all:"
echo "  docker images | grep '$REGISTRY.*$TAG' | awk '{print \$1\":\"\$2}' | xargs -L1 docker push"
echo ""
echo "To deploy:"
echo "  ./scripts/deploy-production.sh $TAG"
