import WorkflowIntegration from "@/components/workflow-integration";

export default function WorkflowAssistant() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Smart Workflow Assistant</h1>
        <p className="text-gray-600 mt-1">Streamline your dealership processes with intelligent workflow automation</p>
      </div>
      
      <WorkflowIntegration />
    </div>
  );
}