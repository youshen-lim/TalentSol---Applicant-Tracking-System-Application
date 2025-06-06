import React from 'react';

/**
 * Test page to verify horizontal scrolling works across all screen sizes
 * This page should be removed after testing is complete
 */
const HorizontalScrollTest = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Horizontal Scroll Test Page</h1>
        <p className="text-gray-600 mb-8">
          This page tests horizontal scrolling functionality. Try resizing your browser window to see if horizontal scrolling works.
        </p>
      </div>

      {/* Test 1: Basic horizontal scroll with enhanced-scrollbar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Test 1: Basic Enhanced Scrollbar</h2>
        <div className="overflow-x-auto enhanced-scrollbar smooth-scroll">
          <div className="flex gap-4 pb-2" style={{ width: '2000px' }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex-shrink-0 w-64 h-32 bg-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="font-medium">Card {i + 1}</div>
                <div className="text-sm text-gray-600">Width: 256px</div>
                <div className="text-xs text-gray-500">Total container: 2000px</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test 2: Blue themed scrollbar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Test 2: Blue Themed Scrollbar</h2>
        <div className="overflow-x-auto enhanced-scrollbar-blue smooth-scroll">
          <div className="flex gap-4 pb-2" style={{ width: '1800px' }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex-shrink-0 w-72 h-40 bg-green-100 border border-green-200 rounded-lg p-4">
                <div className="font-medium">Blue Scroll Card {i + 1}</div>
                <div className="text-sm text-gray-600">Width: 288px</div>
                <div className="text-xs text-gray-500">Should have blue scrollbar</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test 3: Very wide content to force scrolling */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Test 3: Very Wide Content</h2>
        <div className="overflow-x-auto enhanced-scrollbar smooth-scroll">
          <div className="bg-purple-100 border border-purple-200 rounded-lg p-4" style={{ width: '3000px', height: '100px' }}>
            <div className="font-medium">This div is 3000px wide</div>
            <div className="text-sm text-gray-600">It should definitely require horizontal scrolling on any normal screen</div>
            <div className="text-xs text-gray-500">Scroll right to see more content →→→</div>
            <div className="absolute right-4 top-4 bg-purple-200 px-2 py-1 rounded text-xs">
              You found the end! ← Scroll back left
            </div>
          </div>
        </div>
      </div>

      {/* Test 4: Table with many columns */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Test 4: Wide Table</h2>
        <div className="overflow-x-auto enhanced-scrollbar smooth-scroll">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {Array.from({ length: 15 }, (_, i) => (
                  <th key={i} className="border border-gray-200 px-4 py-2 text-left whitespace-nowrap">
                    Column {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 15 }, (_, colIndex) => (
                    <td key={colIndex} className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                      Row {rowIndex + 1}, Col {colIndex + 1}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test 5: Flex with many items */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Test 5: Many Flex Items</h2>
        <div className="overflow-x-auto enhanced-scrollbar-blue smooth-scroll">
          <div className="flex gap-3 pb-2">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="flex-shrink-0 w-32 h-24 bg-yellow-100 border border-yellow-200 rounded-lg p-2 text-center">
                <div className="text-sm font-medium">Item {i + 1}</div>
                <div className="text-xs text-gray-500">128px wide</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-8">
        <h3 className="font-semibold text-red-800 mb-2">Testing Instructions:</h3>
        <ul className="text-sm text-red-700 space-y-1">
          <li>• Resize your browser window to be narrow (mobile size)</li>
          <li>• Each test section should show horizontal scrollbars when content overflows</li>
          <li>• Scrollbars should be styled (not default browser scrollbars)</li>
          <li>• Blue themed sections should have blue scrollbars</li>
          <li>• Scrolling should be smooth</li>
        </ul>
      </div>
    </div>
  );
};

export default HorizontalScrollTest;
