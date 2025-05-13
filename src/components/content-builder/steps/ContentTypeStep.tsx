
// Find this section in the file:
{selectedSolution && (
  <div className="mt-6 space-y-4">
    <h3 className="text-lg font-medium">Selected Solution: {selectedSolution.name}</h3>
    <p>{selectedSolution.description}</p>
    
    {/* Display key features */}
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Features</h4>
      <ul className="list-disc pl-5 space-y-1">
        {selectedSolution.features.slice(0, 4).map((feature, index) => (
          <li key={index} className="text-sm">{feature}</li>
        ))}
      </ul>
    </div>
    
    {/* Display benefits if available */}
    {selectedSolution.benefits && selectedSolution.benefits.length > 0 && (
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Benefits</h4>
        <ul className="list-disc pl-5 space-y-1">
          {selectedSolution.benefits.slice(0, 3).map((benefit, index) => (
            <li key={index} className="text-sm">{benefit}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}
